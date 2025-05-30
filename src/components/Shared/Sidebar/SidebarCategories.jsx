"use client";

import { useGetAllCategoriesQuery } from "@/redux/services/category/categoryApi";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { selectFilter, setFilter } from "@/redux/services/device/deviceSlice";

const SidebarCategories = () => {
  const dispatch = useDispatch();
  const searchParams = useSelector(selectFilter);

  const itemClickHandler = (item) => {
    if (item) {
      dispatch(setFilter(item));
    }
  };

  const { data: categories } = useGetAllCategoriesQuery();
  const [openKeys, setOpenKeys] = useState([]);

  const toggleOpenKey = (key) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const renderSubcategories = (subcategories) => {
    return subcategories.map((subcategory) => (
      <li key={subcategory._id} className="pl-6">
        <Link href={`/products`}>
          <span
            className={`hover:text-primary duration-300 ${
              searchParams === `${subcategory.name}` ? "text-primary" : ""
            }`}
            onClick={() => itemClickHandler(subcategory?.name)}
          >
            {subcategory.name}
          </span>
        </Link>
      </li>
    ));
  };

  const renderCategories = (categories) => {
    return categories.map((category) => (
      <Link href={`/products`} key={category._id} className="mt-3">
        <div
          className={`flex items-center justify-between cursor-pointer hover:text-primary ml-3 my-4 pr-2 duration-300 ${
            searchParams === `${category.name}` ? "text-primary" : ""
          }`}
          onClick={() => toggleOpenKey(category._id)}
        >
          <span onClick={() => itemClickHandler(category?.name)}>
            {category.name}
          </span>
          {category.subcategories && category.subcategories.length > 0 && (
            <span className="text-sm">
              {openKeys.includes(category._id) ? (
                <DownOutlined className="text-gray-400" />
              ) : (
                <RightOutlined className="text-gray-400" />
              )}
            </span>
          )}
        </div>
        {openKeys.includes(category._id) && (
          <ul className="ml-4 border-l border-gray-200 mt-2">
            {renderSubcategories(category.subcategories)}
          </ul>
        )}
      </Link>
    ));
  };

  const renderParentCategories = () => {
    if (!categories?.results) return null;

    return categories.results
      .filter((item) => item.level === "parentCategory")
      .map((parentCategory) => (
        <Link
          href={`/products`}
          key={parentCategory._id}
          className="mt-4 group"
        >
          <div
            className="flex items-center justify-between cursor-pointer group-hover:text-primary duration-300 border-y py-2 odd:border-b-0"
            onClick={() => toggleOpenKey(parentCategory._id)}
          >
            <span
              className={`flex items-center gap-4 ${
                searchParams === `${parentCategory.name}` ? "text-primary" : ""
              }`}
              onClick={() => itemClickHandler(parentCategory?.name)}
            >
              <Image
                src={
                  parentCategory.attachment ??
                  "https://thumbs.dreamstime.com/b/demo-demo-icon-139882881.jpg"
                }
                alt={parentCategory?.name ?? "demo"}
                width={40}
                height={20}
                className="w-[40px] h-[40px] rounded object-contain"
              />
              <span>{parentCategory.name}</span>
            </span>
            {parentCategory.categories &&
              parentCategory.categories.length > 0 && (
                <span className="text-sm text-gray-400 group-hover:text-primary duration-300">
                  {openKeys.includes(parentCategory._id) ? (
                    <DownOutlined />
                  ) : (
                    <RightOutlined />
                  )}
                </span>
              )}
          </div>
          {openKeys.includes(parentCategory._id) && (
            <ul className="ml-4 border-l border-gray-200 mt-2">
              {renderCategories(parentCategory.categories)}
            </ul>
          )}
        </Link>
      ));
  };

  return (
    <aside className="bg-white rounded-lg p-[25px]">
      <ul className="w-[300px] overflow-y-auto h-[800px] space-y-2 pr-3">
        {renderParentCategories()}
      </ul>
    </aside>
  );
};

export default SidebarCategories;
