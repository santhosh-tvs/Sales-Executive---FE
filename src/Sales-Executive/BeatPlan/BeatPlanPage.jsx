import React from "react";
import Header from "../header/Header";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import BeatPlan from "./beatplan";

const BeatPlanPage = () => {
  return (
    <div className="beat-plan-page">
      <Header />
      <Breadcrumb currentPage="Beat Plan" />
      <BeatPlan />
    </div>
  );
};

export default BeatPlanPage;