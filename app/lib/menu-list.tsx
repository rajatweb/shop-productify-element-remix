import type { LucideIcon } from "lucide-react";
import {
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/app",
          label: "Dashboard",
          active: pathname.includes("/app"),
          icon: LayoutGrid,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Contents",
      menus: [
        // {
        //   href: "/app/orders",
        //   label: "Orders",
        //   active: pathname.includes("/posts"),
        //   icon: SquarePen,
        //   submenus: [
        //     {
        //       href: "/orders",
        //       label: "All Orders",
        //       active: pathname === "/order",
        //     },
        //     {
        //       href: "/posts/new",
        //       label: "New Post",
        //       active: pathname === "/posts/new",
        //     },
        //   ],
        // },
        {
          href: "/app/products",
          label: "Products",
          active: pathname.includes("/app/products"),
          icon: Bookmark,
          submenus: [],
        },
        {
          href: "/app/orders",
          label: "Orders",
          active: pathname.includes("/orders"),
          icon: SquarePen,
          submenus: [],
        },
        // {
        //   href: "/tags",
        //   label: "Tags",
        //   active: pathname.includes("/tags"),
        //   icon: Tag,
        //   submenus: [],
        // },
      ],
    },
    {
        groupLabel: "Theme",
        menus: [
          {
            href: "/app/theme-extensions",
            label: "Extensions",
            active: pathname.includes("/app/theme-extensions"),
            icon: LayoutGrid,
            submenus: [],
          },
        ],
      },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/users",
          label: "Users",
          active: pathname.includes("/users"),
          icon: Users,
          submenus: [],
        },
        {
          href: "/account",
          label: "Account",
          active: pathname.includes("/account"),
          icon: Settings,
          submenus: [],
        },
      ],
    },
  ];
}
