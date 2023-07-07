import React, { Fragment, useEffect } from "react";
// import { CgMouse } from "react-icons/all";
import "./Home.css";
import MetaData from "../layout/MetaData";
import { useSelector, useDispatch } from "react-redux";
import { clearErrors, getProduct } from "../../actions/productActions";
import ProductCard from "./ProductCard";
import Loader from "../loader/Loader";

import { useAlert } from "react-alert";

const Home = () => {
  const alert = useAlert();
  //call redux product detail like name ...
  const dispath = useDispatch(); //used dispatch for access data from api
  const { loading, error, products } = useSelector((state) => state.products);
  //used dispatch for access data from api
  useEffect(() => {
    if (error) {
      alert.error(error);
      dispath(clearErrors());
    }
    dispath(getProduct());
  }, [dispath, error, alert]);
  // end redux
  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title={"ECOMMERCE"} />
          <div className="banner">
            <p>Welcome to Ecommerce</p>
            <h1>FIND AMAZING PRODUCTS BELOW</h1>

            <a href="#container">
              <button>Scroll</button>
            </a>
          </div>

          <h2 className="homeHeading">Featured Products</h2>
          <div className="container" id="container">
            {/* map function call all data from api products */}
            {products &&
              products.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            {/* end map function call all data from api products  */}
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Home;
