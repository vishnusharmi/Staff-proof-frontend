import SidebarItems from "../SidebarItems/SidebarItems.jsx";

const Sidebar = () => {
  return (
    <aside className="w-full min-h-full h-auto  hidden md:flex flex-col justify-between text-black font-bold transition-all duration-300">
      <SidebarItems />
    </aside>
  );
};

export default Sidebar;
