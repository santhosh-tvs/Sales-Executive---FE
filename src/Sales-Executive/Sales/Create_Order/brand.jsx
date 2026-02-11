import React, { useState } from "react";
import Header from "../../";
import "../../../styles/home-components/Brands.css";
import searchIcon from "../../../assets/Icons/MagnifyingGlass.png";

// Brand Images
import ThreeM from "../../../assets/Images/brand/3M.png";
import Ashokleyland from "../../../assets/Images/brand/ashok_leyland 2.png";
import BEHR from "../../../assets/Images/brand/BEHR.png";
import BOSCH from "../../../assets/Images/brand/BOSCH.png";
import Castrol from "../../../assets/Images/brand/Castrol.png";
import Champion from "../../../assets/Images/brand/Champion.png";
import Contitech from "../../../assets/Images/brand/CONTITECH.png";
import Denso from "../../../assets/Images/brand/DENSO.png";
import DLPH from "../../../assets/Images/brand/DLPH.png";
import Elofic from "../../../assets/Images/brand/ELOFIC.png";
import Exedy from "../../../assets/Images/brand/EXEDY.png";
import Finolex from "../../../assets/Images/brand/finolex.png";
import GoodYear from "../../../assets/Images/brand/GOODYEAR.png";
import Hella from "../../../assets/Images/brand/HELLA.png";
import Iifi from "../../../assets/Images/brand/IIFI.png";
import Ina from "../../../assets/Images/brand/INA.png";
import Jai from "../../../assets/Images/brand/JAI.png";
import Jk from "../../../assets/Images/brand/jk poineer.png";
import JkTyre from "../../../assets/Images/brand/JKTYRE.png";
import Lucas from "../../../assets/Images/brand/Lucas Tvs Logo-01.png";
import LUK from "../../../assets/Images/brand/luk.png";
import Mahle from "../../../assets/Images/brand/MAHLE.png";
import Mfc from "../../../assets/Images/brand/MFC.png";
import Ngk from "../../../assets/Images/brand/NGK.png";
import Phc from "../../../assets/Images/brand/PHC.png";
import Rane from "../../../assets/Images/brand/RANE.png";
import Sachs from "../../../assets/Images/brand/Sachs.png";
import Schaeffler from "../../../assets/Images/brand/schaeffler.png";
import Smic from "../../../assets/Images/brand/SMIC.png";
import Spicer from "../../../assets/Images/brand/spicer.png";
import TVS from "../../../assets/Images/brand/TVS.png";
import Ucap from "../../../assets/Images/brand/UCAP Logo-01.png";
import Umax from "../../../assets/Images/brand/umax.png";
import Valeo from "../../../assets/Images/brand/VALEO.png";

const brandsList = [
  Hella, LUK, BOSCH, Contitech, Ashokleyland, Lucas, Ucap, Valeo, Ina,
  Finolex, Jk, Schaeffler, Spicer, Umax, TVS, DLPH, Champion,
  ThreeM, Phc, Elofic, BEHR, Sachs, Mfc, Castrol, Mahle, Exedy, Denso,
  Ngk, Rane, Iifi, Smic, Jai, JkTyre, GoodYear
].map((image) => ({ image }));

const HomeBrands = () => {
  const [search, setSearch] = useState("");

  const filteredBrands = brandsList.filter(
    (brand) =>
      brand.image
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div>
      <Header />

      <div className="home-brand">
        <div className="home-brand-header">
          <h3>Brands</h3>
          <div className="home-brand-search-box">
            <input
              type="text"
              placeholder="Search Brand"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={searchIcon} alt="Search" />
          </div>
        </div>

        <div className="home-brand-grid">
          {filteredBrands.map((brand, idx) => (
            <div key={idx} className="home-brand-card">
              <img src={brand.image} alt="Brand" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeBrands;
