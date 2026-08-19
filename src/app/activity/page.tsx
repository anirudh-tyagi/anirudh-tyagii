import { redirect } from 'next/navigation';

// The site is a single scrolling page now; this route is kept so links
// shared before the change still land in the right place.
export default function ActivityRedirect() {
  redirect('/#activity');
}
