import LOGIN from '../pages/login.jsx';
import HOME from '../pages/home.jsx';
import MEETINGROOMMANAGEMENT from '../pages/meetingRoomManagement.jsx';
import MEETINGROOMBOOKING from '../pages/meetingRoomBooking.jsx';
import PERSONALDASHBOARD from '../pages/personalDashboard.jsx';
import EMPLOYEEMANAGEMENT from '../pages/employeeManagement.jsx';
import CAROUSELMANAGEMENT from '../pages/carouselManagement.jsx';
import DEPARTMENTMANAGEMENT from '../pages/departmentManagement.jsx';
import REGULATIONMANAGEMENT from '../pages/regulationManagement.jsx';
import PDFVIEWER from '../pages/pdfViewer.jsx';
import REGULATIONVIEWER from '../pages/regulationViewer.jsx';
import QUALITYSYSTEM from '../pages/qualitySystem.jsx';
import SAFETYENVIRONMENTSYSTEM from '../pages/safetyEnvironmentSystem.jsx';
import MEETINGROOMMANAGEMENTADMIN from '../pages/meetingRoomManagementAdmin.jsx';
import PERMISSIONMANAGEMENT from '../pages/permissionManagement.jsx';
import EMPLOYEEMANAGEMENTLOGIN from '../pages/employeeManagementLogin.jsx';
export const routers = [{
  id: "login",
  component: LOGIN
}, {
  id: "home",
  component: HOME
}, {
  id: "meetingRoomManagement",
  component: MEETINGROOMMANAGEMENT
}, {
  id: "meetingRoomBooking",
  component: MEETINGROOMBOOKING
}, {
  id: "personalDashboard",
  component: PERSONALDASHBOARD
}, {
  id: "employeeManagement",
  component: EMPLOYEEMANAGEMENT
}, {
  id: "carouselManagement",
  component: CAROUSELMANAGEMENT
}, {
  id: "departmentManagement",
  component: DEPARTMENTMANAGEMENT
}, {
  id: "regulationManagement",
  component: REGULATIONMANAGEMENT
}, {
  id: "pdfViewer",
  component: PDFVIEWER
}, {
  id: "regulationViewer",
  component: REGULATIONVIEWER
}, {
  id: "qualitySystem",
  component: QUALITYSYSTEM
}, {
  id: "safetyEnvironmentSystem",
  component: SAFETYENVIRONMENTSYSTEM
}, {
  id: "meetingRoomManagementAdmin",
  component: MEETINGROOMMANAGEMENTADMIN
}, {
  id: "permissionManagement",
  component: PERMISSIONMANAGEMENT
}, {
  id: "employeeManagementLogin",
  component: EMPLOYEEMANAGEMENTLOGIN
}]