import { Link } from "react-router-dom";

const Section = ({ title, links }: { title: string; links: { to: string; label: string }[] }) => (
  <section style={{ marginBottom: "16px" }}>
    <h2>{title}</h2>
    <ul>
      {links.map((link) => (
        <li key={link.to}>
          <Link to={link.to}>{link.label}</Link>
        </li>
      ))}
    </ul>
  </section>
);

const TestRoutePage = () => {
  return (
    <div style={{ padding: "16px" }}>
      <h1>Test Route (Dev Only)</h1>
      <Section
        title="Auth"
        links={[
          { to: "/login", label: "/login" },
          { to: "/register", label: "/register" }
        ]}
      />
      <Section
        title="Admin"
        links={[
          { to: "/admin", label: "/admin" },
          { to: "/admin/locations", label: "/admin/locations" },
          { to: "/admin/locations/create", label: "/admin/locations/create" },
          { to: "/admin/lockers", label: "/admin/lockers" },
          { to: "/admin/lockers/create", label: "/admin/lockers/create" },
          {
            to: "/admin/lockers/00000000-0000-0000-0000-000000000000/compartments",
            label: "/admin/lockers/:id/compartments"
          },
          { to: "/admin/tools/expire", label: "/admin/tools/expire" }
        ]}
      />
      <Section
        title="Courier"
        links={[
          { to: "/courier/parcels/create", label: "/courier/parcels/create" },
          { to: "/courier/parcels/reserve", label: "/courier/parcels/reserve" },
          { to: "/courier/parcels/deposit", label: "/courier/parcels/deposit" },
          { to: "/courier/parcels/ready", label: "/courier/parcels/ready" }
        ]}
      />
      <Section
        title="Recipient"
        links={[
          { to: "/pickup/request-otp", label: "/pickup/request-otp" },
          { to: "/pickup/verify-otp", label: "/pickup/verify-otp" },
          { to: "/pickup/result", label: "/pickup/result" }
        ]}
      />
    </div>
  );
};

export default TestRoutePage;
export { TestRoutePage };
