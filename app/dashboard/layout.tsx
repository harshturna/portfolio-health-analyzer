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
    name: "Chat with your portfolio",
    link: "/dashboard/chat",
  },
];

const CharactersLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div className="ml-5 lg:ml-24 mt-4">
        <NavTabs tabs={navTabs} />
      </div>
      {children}
    </div>
  );
};

export default CharactersLayout;
