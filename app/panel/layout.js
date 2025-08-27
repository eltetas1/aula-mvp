import Protected from "@/components/Protected";
import PanelNav from "@/components/PanelNav";

export default function PanelLayout({ children }) {
  return (
    <Protected>
      <PanelNav />
      <div className="container space-y-6">{children}</div>
    </Protected>
  );
}
