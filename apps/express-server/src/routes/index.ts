import { type Router } from 'express';
import { employeeRouter } from './employees/controller';
import { enquiryRouter } from './enquiries/controller';

type RouteInfo = {
  path: string;
  router: Router;
};

function generatePrefix(routeName: string) {
  return `/api${routeName}`;
}

const routesList: RouteInfo[] = [
  {
    path: generatePrefix('/employees'),
    router: employeeRouter
  },
  {
    path: generatePrefix('/enquiries'),
    router: enquiryRouter
  }
];

export { routesList };
