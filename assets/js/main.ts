import '../css/index.css';
import { greeting } from './app/greeting';

// Stand-in for the contract types until they land with the extension skeleton (#2628).
type MountOptions = { container: HTMLElement };
type Unmount = () => void;

/** Placeholder entry proving the toolchain end to end; the real sections replace it. */
export function mount({ container }: MountOptions): Unmount {
  const root = document.createElement('p');
  root.textContent = greeting();
  container.append(root);

  return () => {
    root.remove();
  };
}
