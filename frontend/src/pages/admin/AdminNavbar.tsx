import { Code, Group, ScrollArea } from "@mantine/core";
import { LinksGroup } from "./NavbarLinksGroup";
import { UserButton } from "./UserButton";
import { Logo } from "./Logo";
import classes from "./AdminNavbar.module.css";

const mockdata = [
  {
    label: "Orders",
    initiallyOpened: true,
    links: [
      { label: "All Orders", link: "/adminnavbar/orders" },
      { label: "Pending Orders", link: "/adminnavbar" },
      { label: "Accepted Orders", link: "/adminnavbar/acceptedorders" },
      { label: "Cancelled Orders", link: "/adminnavbar/canceledorders" },
      { label: "Confirmed Orders", link: "/adminnavbar/confirmedorders" },
    ],
  },
  { label: "Coupon", link: "/adminnavbar/discount" },
  { label: "Message", link: "/adminnavbar/message" },
  { label: "Gallery", link: "/adminnavbar/gallery" },
  { label: "Banner", link: "/adminnavbar/banner" },
  {
    label: "Menu",
    initiallyOpened: false,
    links: [
      { label: "All Menu", link: "/adminnavbar/menu" },
      {
        label: "Category",
        link: "/adminnavbar/category",
      },
    ],
  },
  {
    label: "Reservation",
    initiallyOpened: false,
    links: [
      { label: "All Reservation", link: "/adminnavbar/reservation" },
      { label: "Pending Reservation", link: "/adminnavbar/pendingreservation" },
      {
        label: "Confirmend Reservation",
        link: "/adminnavbar/confirmendreservation",
      },
      {
        label: "Cancelled Reservation",
        link: "/adminnavbar/cancelledreservation",
      },
    ],
  },
];

export default function NavbarNested() {
  const links = mockdata.map((item) => (
    <LinksGroup {...item} key={item.label} />
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify="space-between">
          <Logo style={{ width: 120 }} />
          <Code fw={700}>v3.1.2</Code>
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <UserButton />
      </div>
    </nav>
  );
}
