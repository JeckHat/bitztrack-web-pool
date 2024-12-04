"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Fragment } from "react";

export function NavigationBreadcrumbs() {
  const pathName = usePathname();
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathName
          .split("/")
          .filter((crumb) => !!crumb)
          .map((crumb, index, array) => {
            const finalLink = array
              .filter((_el, index2) => index >= index2)
              .join("/");
            const isLast = index + 1 === array.length;
            const label = crumb.replaceAll("-", " ");
            return (
              <Fragment key={crumb}>
                <BreadcrumbItem className="block">
                  {isLast ? (
                    <BreadcrumbPage className="capitalize">
                      {label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      className="capitalize"
                      href={`/${finalLink}`}
                    >
                      {label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {isLast ? null : <BreadcrumbSeparator className="block" />}
              </Fragment>
            );
          })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
