import { type Router } from 'express';
import { employeeRouter } from './employee/controller';
import { enquiryRouter } from './enquiry/controller';

type RouteInfo = {
  path: string;
  router: Router;
};

function generatePrefix(routeName: string) {
  return `/api${routeName}`;
}

const routesList: RouteInfo[] = [
  {
    path: generatePrefix('/employee'),
    router: employeeRouter
  },
  {
    path: generatePrefix('/enquiry'),
    router: enquiryRouter
  }
];

export { routesList };
