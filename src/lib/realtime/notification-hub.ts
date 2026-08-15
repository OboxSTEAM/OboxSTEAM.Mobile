import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel,
} from "@microsoft/signalr";

import { getApiBaseUrl } from "@/lib/api/config";
import { notificationSchema, type Notification } from "@/lib/api/entities/notification";
import { getAuthSession } from "@/lib/auth/session";

export type NotificationHubState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

export type NotificationHubHandlers = {
  onNotification: (notification: Notification) => void;
  onStateChange?: (state: NotificationHubState) => void;
};

const EVENT_NAME = "notificationReceived";

function mapConnectionState(state: HubConnectionState): NotificationHubState {
  switch (state) {
    case HubConnectionState.Connecting:
      return "connecting";
    case HubConnectionState.Connected:
      return "connected";
    case HubConnectionState.Reconnecting:
      return "reconnecting";
    case HubConnectionState.Disconnecting:
    case HubConnectionState.Disconnected:
      return "disconnected";
    default:
      return "idle";
  }
}

/**
 * Connect to `{API_BASE}/hubs/notifications` with JWT from SecureStore.
 * Server auto-joins `user:{parentUserId}` and emits `notificationReceived`.
 */
export function startNotificationHub(
  handlers: NotificationHubHandlers,
): () => void {
  let disposed = false;
  let connection: HubConnection | null = null;

  const emitState = (state: NotificationHubState) => {
    if (disposed) return;
    handlers.onStateChange?.(state);
  };

  const build = () =>
    new HubConnectionBuilder()
      .withUrl(`${getApiBaseUrl()}/hubs/notifications`, {
        accessTokenFactory: async () => {
          const session = await getAuthSession();
          return session?.accessToken ?? "";
        },
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2_000, 5_000, 15_000, 30_000])
      .configureLogging(LogLevel.None)
      .build();

  const bind = (hub: HubConnection) => {
    hub.on(EVENT_NAME, (payload: unknown) => {
      if (disposed) return;
      const parsed = notificationSchema.safeParse(payload);
      if (!parsed.success) return;
      handlers.onNotification(parsed.data);
    });

    hub.onreconnecting(() => emitState("reconnecting"));
    hub.onreconnected(() => emitState("connected"));
    hub.onclose(() => {
      if (!disposed) emitState("disconnected");
    });
  };

  const start = async () => {
    if (disposed) return;
    emitState("connecting");
    connection = build();
    bind(connection);

    try {
      await connection.start();
      if (disposed) {
        await connection.stop().catch(() => undefined);
        return;
      }
      emitState(mapConnectionState(connection.state));
    } catch {
      if (!disposed) emitState("disconnected");
    }
  };

  void start();

  return () => {
    disposed = true;
    const hub = connection;
    connection = null;
    if (!hub) {
      emitState("disconnected");
      return;
    }
    hub.off(EVENT_NAME);
    void hub.stop().finally(() => emitState("disconnected"));
  };
}
