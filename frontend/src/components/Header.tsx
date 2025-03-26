import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="border-b">
      <div className="container-wrapper flex h-14 items-center">
        <Link to="/" className="text-xl font-bold hover:text-primary/80 transition-colors">
          GroupMeet
        </Link>
      </div>
    </header>
  );
}
