import * as signalR from '@microsoft/signalr';
import { toast } from 'react-toastify';

const URL = import.meta.env.VITE_API_BASE_URL + '/notificationHub'; // Your SignalR Hub URL

class NotificationService {
  private connection: signalR.HubConnection;

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(URL, {
        accessTokenFactory: () => {
          // Get the token from local storage or wherever you store it
          const token = localStorage.getItem('token');
          return token || '';
        },
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('ReceiveNotification', notification => {
      console.log('Notification received: ', notification);
      toast.info(notification.message);
    });
  }

  public start() {
    if (this.connection.state === signalR.HubConnectionState.Disconnected) {
      this.connection
        .start()
        .catch(err => console.error('SignalR Connection Error: ', err));
    }
  }

  public stop() {
    if (this.connection.state === signalR.HubConnectionState.Connected) {
      this.connection.stop();
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;
