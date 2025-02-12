import Link from "next/link";

const NavTabs = () => {
  return (
    <div className="flex gap-1 text-sm">
      <Link href="/" className="bg-gray-200 rounded-sm py-2 px-4">
        Home
      </Link>
      <Link href="/dashboard" className="bg-white rounded-sm px-4 py-2">
        Dashboard
      </Link>
    </div>
  );
};

export default NavTabs;
