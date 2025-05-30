"use client";

import { useGetAllBrandsQuery } from "@/redux/services/brand/brandApi";
import { useGetAllCategoriesQuery } from "@/redux/services/category/categoryApi";
import { useGetAllProductsQuery } from "@/redux/services/product/productApi";
import { Slider, Select, Button, Modal, Radio, Spin } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useGetAllGlobalSettingQuery } from "@/redux/services/globalSetting/globalSettingApi";
import ProductCard from "../Home/Products/ProductCard";
import { debounce } from "lodash";
import RelatedCategories from "./RelatedCategories";
import { useSelector } from "react-redux";
import { selectFilter } from "@/redux/services/device/deviceSlice";

const { Option } = Select;

const AllProducts = () => {
  const searchParams = useSelector(selectFilter);

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sorting, setSorting] = useState("");
  const [filterModal, setFilterModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [availability, setAvailability] = useState("inStock");
  const [loading, setLoading] = useState(false);
  const [delayedLoading, setDelayedLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const { data: globalData } = useGetAllGlobalSettingQuery();
  const { data: brandData } = useGetAllBrandsQuery();
  const { data: categoryData } = useGetAllCategoriesQuery();
  const { data: productData, isLoading } = useGetAllProductsQuery();

  const activeBrands = useMemo(
    () => brandData?.results?.filter((item) => item?.status !== "Inactive"),
    [brandData]
  );

  const activeCategories = useMemo(
    () => categoryData?.results?.filter((item) => item?.status !== "Inactive"),
    [categoryData]
  );

  const activeProducts = useMemo(
    () =>
      productData?.results?.filter((item) => item?.status !== "Inactive") || [],
    [productData]
  );

  const debouncedSetSearchFilter = useMemo(
    () => debounce((value) => setSearchFilter(value?.toLowerCase()), 300),
    []
  );

  useEffect(() => {
    if (searchParams) {
      debouncedSetSearchFilter(searchParams);
    } else {
      setSearchFilter("");
      setSelectedBrand("");
      setSelectedCategory("");
      setPriceRange([0, 10000]);
      setSorting("");
    }
    return () => debouncedSetSearchFilter.cancel();
  }, [searchParams, debouncedSetSearchFilter]);

  useEffect(() => {
    if (searchFilter) {
      const matchedBrand = activeBrands?.find(
        (brand) => brand?.name === searchParams
      );

      const matchedCategory = !matchedBrand
        ? activeCategories?.find((category) => category?.name === searchParams)
        : null;

      setSelectedBrand(matchedBrand?.name || "");
      setSelectedCategory(matchedCategory?.name || "");
    } else {
      setSelectedBrand("");
      setSelectedCategory("");
    }
  }, [searchFilter, activeBrands, activeCategories, searchParams]);

  useEffect(() => {
    const applyFilters = () => {
      setLoading(true);

      let filtered = activeProducts?.filter((product) => {
        if (!product) return false;

        const isBrandMatch = selectedBrand
          ? selectedBrand.toLowerCase() === product?.brand?.name?.toLowerCase()
          : true;

        const isCategoryMatch =
          selectedCategory !== ""
            ? selectedCategory.toLowerCase() ===
              product?.category?.name?.toLowerCase()
            : true;

        const isSearchMatch = searchFilter
          ? product?.brand?.name?.toLowerCase().includes(searchFilter) ||
            product?.category?.name?.toLowerCase().includes(searchFilter) ||
            product?.name?.toLowerCase().includes(searchFilter)
          : true;

        const isPriceMatch =
          product.sellingPrice >= priceRange[0] &&
          product.sellingPrice <= priceRange[1];

        const isAvailabilityMatch =
          availability === "inStock"
            ? product.stock > 0
            : availability === "outOfStock"
            ? product.stock === 0
            : true;

        return (
          isBrandMatch &&
          isCategoryMatch &&
          isSearchMatch &&
          isPriceMatch &&
          isAvailabilityMatch
        );
      });

      let sorted = [...filtered];
      if (sorting === "PriceLowToHigh") {
        sorted.sort(
          (a, b) =>
            (a.offerPrice || a.sellingPrice) - (b.offerPrice || b.sellingPrice)
        );
      } else if (sorting === "PriceHighToLow") {
        sorted.sort(
          (a, b) =>
            (b.offerPrice || b.sellingPrice) - (a.offerPrice || a.sellingPrice)
        );
      }

      setFilteredProducts(sorted);
      setLoading(false);

      if (sorted.length > 0) {
        setVisibleProducts(sorted.slice(0, 30));
        setHasMore(sorted.length > 30);
      } else {
        setVisibleProducts([]);
        setHasMore(false);
      }
    };

    applyFilters();
  }, [
    activeProducts,
    selectedBrand,
    selectedCategory,
    priceRange,
    sorting,
    availability,
    searchFilter,
  ]);

  const loadMoreProducts = () => {
    if (filteredProducts?.length > visibleProducts?.length) {
      setVisibleProducts([
        ...visibleProducts,
        ...filteredProducts.slice(
          visibleProducts.length,
          visibleProducts.length + 24
        ),
      ]);
    } else {
      setHasMore(false);
    }
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
  };

  const handleSortingChange = (value) => {
    setSorting(value);
  };

  const handleAvailabilityChange = (e) => {
    setAvailability(e.target.value);
  };

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setDelayedLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <section className="py-10 relative -mt-5">
      <div className="new-container">
        <div className="bg-gray-200 flex items-center gap-2 justify-between py-3 px-2 lg:px-6 mb-6 rounded-xl">
          <p className="text-xs md:text-base">{searchParams || "Products"}</p>
          <Button type="primary" onClick={() => setFilterModal(true)}>
            Advance Filter
          </Button>
          <div className="flex items-center lg:w-1/4">
            <Select
              allowClear
              placeholder="Select Sorting"
              style={{ width: "100%" }}
              onChange={handleSortingChange}
            >
              <Option value="PriceLowToHigh">Price Low To High</Option>
              <Option value="PriceHighToLow">Price High To Low</Option>
            </Select>
          </div>
        </div>
        <RelatedCategories searchParam={searchParams} />
        <div
          className="overflow-y-auto h-screen"
          onScroll={(e) => {
            if (
              e.target.scrollTop + e.target.clientHeight >=
              e.target.scrollHeight - 100
            ) {
              loadMoreProducts();
            }
          }}
        >
          {loading || delayedLoading || isLoading ? (
            <div className="flex justify-center py-10">
              <Spin size="large" />
            </div>
          ) : visibleProducts?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-5 xl:gap-0 xl:gap-y-5">
              {visibleProducts?.map((product) => (
                <ProductCard key={product?._id} item={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-32 text-xl">
              No products found.
            </p>
          )}
          {hasMore && !loading && (
            <div className="text-center py-4">
              <Spin size="large" />
            </div>
          )}
        </div>
      </div>
      <Modal
        open={filterModal}
        onCancel={() => setFilterModal(false)}
        footer={null}
        centered
      >
        <div className="w-full p-4">
          <h2 className="mb-4 text-lg font-semibold">Filter Products</h2>
          <div className="mb-6">
            <label className="block mb-2 font-semibold">Price Range</label>
            <Slider
              range
              min={0}
              max={10000}
              defaultValue={[0, 10000]}
              value={priceRange}
              onChange={handlePriceChange}
              step={50}
              tooltip={{
                formatter: (value) =>
                  `${globalData?.results?.currency} ${value}`,
              }}
            />
            <div className="flex justify-between mt-2 text-sm">
              <span>{globalData?.results?.currency + " " + priceRange[0]}</span>
              <span>{globalData?.results?.currency + " " + priceRange[1]}</span>
            </div>
          </div>
          <div className="mb-6 rounded-xl border p-5">
            <label className="block mb-2 font-semibold">Availability</label>
            <Radio.Group
              value={availability}
              onChange={handleAvailabilityChange}
              className="flex flex-col gap-2"
            >
              <Radio value="inStock">
                In Stock (
                {filteredProducts?.filter?.((item) => item?.stock > 0).length})
              </Radio>
              <Radio value="outOfStock">
                Out of Stock (
                {filteredProducts?.filter?.((item) => item?.stock < 0).length})
              </Radio>
            </Radio.Group>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default AllProducts;
