import { permanentRedirect } from 'next/navigation';

// The night-studio landing page graduated to the homepage; keep old
// /v2 links working forever.
export default function V2Redirect() {
  permanentRedirect('/');
}
