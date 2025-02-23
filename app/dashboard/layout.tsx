import NavTabs from "@/components/ui/nav-tabs";

const navTabs = [
  {
    name: "Home",
    link: "/",
  },
  {
    name: "Dashboard",
    link: "/dashboard",
  },
  {
    name: "AI Chat",
    link: "/dashboard/chat",
  },
];

export default function CharactersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="ml-5 lg:ml-24">
        <div className="pt-4">
          <NavTabs tabs={navTabs} />
        </div>
      </div>
      {children}
    </div>
  );
}
