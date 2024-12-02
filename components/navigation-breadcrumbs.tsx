"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
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
            return (
              <Fragment key={crumb}>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink className="capitalize" href={`/${finalLink}`}>
                    {crumb.replaceAll("-", " ")}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {index + 1 === array.length ? null : (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
              </Fragment>
            );
          })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
