import { getSystemInfo } from "zmp-sdk";
import {
  AnimationRoutes,
  App,
  Route,
  SnackbarProvider,
  ZMPRouter,
} from "zmp-ui";
import { AppProps } from "zmp-ui/app";

import BottomNavigation from "@/components/bottom-navigation";
import HomePage from "@/pages/index";

const Layout = () => {
  return (
    <App theme={getSystemInfo().zaloTheme as AppProps["theme"]}>
      <SnackbarProvider>
        <ZMPRouter>
          <AnimationRoutes>
            <Route path="/" element={<HomePage />}></Route>
          </AnimationRoutes>
          <BottomNavigation />
        </ZMPRouter>
      </SnackbarProvider>
    </App>
  );
};
export default Layout;
