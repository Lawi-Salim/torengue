import { Toaster } from 'react-hot-toast';

const Notif = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 4000,
      style: { fontSize: '1rem', borderRadius: '8px' }
    }}
  />
);

export default Notif; 