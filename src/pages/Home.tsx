import React from "react";
import { DataGrid } from "../components/DataGrid";

import Header from "../components/Headers";

const Home = () => {
  return (
    <>
      <Header content="Electric Cars" />
      <DataGrid />
    </>
  );
};
export default Home;
