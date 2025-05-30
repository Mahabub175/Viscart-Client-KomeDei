import LinkButton from "@/components/Shared/LinkButton";
import { useGetAllCategoriesQuery } from "@/redux/services/category/categoryApi";
import { setFilter } from "@/redux/services/device/deviceSlice";
import { formatImagePath } from "@/utilities/lib/formatImagePath";
import Image from "next/image";
import { useRef } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { useDispatch } from "react-redux";
import "swiper/css";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const RelatedCategories = ({ searchParam }) => {
  const swiperRef = useRef();
  const dispatch = useDispatch();

  const { data } = useGetAllCategoriesQuery();

  const filteredData = data?.results?.find(
    (item) =>
      item?.status !== "Inactive" &&
      item?.name?.toLowerCase() === searchParam?.toLowerCase()
  );

  const itemClickHandler = (item) => {
    if (item?.name) {
      dispatch(setFilter(item?.name));
    }
  };

  return (
    <div>
      <div className="new-container relative mb-16">
        <Swiper
          onBeforeInit={(swiper) => {
            swiperRef.current = swiper;
          }}
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            480: { slidesPerView: 2 },
            500: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
            1480: { slidesPerView: 5 },
          }}
          navigation
          className="mySwiper mx-auto w-full"
        >
          {filteredData?.level === "parentCategory" &&
            filteredData?.categories?.map((item) => (
              <SwiperSlide
                key={item?._id}
                className="group relative w-[250px] h-[150px] mx-auto rounded-xl"
              >
                <div className="bg-[#E5F3F3] rounded-xl p-2 border-2 border-transparent hover:border-primary duration-300">
                  <LinkButton href={`/products`}>
                    <div
                      className="overflow-hidden w-full h-full rounded-xl"
                      onClick={() => itemClickHandler(item)}
                    >
                      <Image
                        src={
                          formatImagePath(item?.attachment) ??
                          "https://thumbs.dreamstime.com/b/demo-demo-icon-139882881.jpg"
                        }
                        alt={item?.name ?? "demo"}
                        width={160}
                        height={160}
                        className="w-[120px] h-[120px] object-contain rounded-xl mx-auto"
                      />
                    </div>
                  </LinkButton>
                </div>
                <h2 className="text-base font-medium text-center mt-2">
                  {item?.name}
                </h2>
              </SwiperSlide>
            ))}

          {filteredData?.level === "category" &&
            filteredData?.subcategories?.map((item) => (
              <SwiperSlide
                key={item?._id}
                className="group relative w-[250px] h-[150px] mx-auto rounded-xl"
              >
                <div className="bg-[#E5F3F3] rounded-xl p-2 border-2 border-transparent hover:border-primary duration-300">
                  <LinkButton href={`/products`}>
                    <div
                      className="overflow-hidden w-full h-full rounded-xl"
                      onClick={() => itemClickHandler(item)}
                    >
                      <Image
                        src={
                          formatImagePath(item?.attachment) ??
                          "https://thumbs.dreamstime.com/b/demo-demo-icon-139882881.jpg"
                        }
                        alt={item?.name ?? "demo"}
                        width={160}
                        height={160}
                        className="w-[120px] h-[120px] object-contain rounded-xl mx-auto"
                      />
                    </div>
                  </LinkButton>
                </div>
                <h2 className="text-base font-medium text-center mt-2">
                  {item?.name}
                </h2>
              </SwiperSlide>
            ))}
        </Swiper>

        {((filteredData?.level === "parentCategory" &&
          filteredData?.categories.length > 0) ||
          (filteredData?.level === "category" &&
            filteredData?.subcategories.length > 0)) && (
          <div className="flex items-center justify-center gap-5 mt-10">
            <button
              className="lg:w-10 lg:h-10 flex z-10 items-center justify-center rounded-full bg-white text-black border border-primary hover:bg-primary hover:text-white duration-300 absolute top-[25%] left-0 lg:left-8 xxl:left-0"
              onClick={() => swiperRef.current.slidePrev()}
            >
              <FaAngleLeft className="text-2xl" />
            </button>
            <button
              className="lg:w-10 lg:h-10 z-10 flex items-center justify-center rounded-full bg-white text-black border border-primary hover:bg-primary hover:text-white duration-300 absolute top-[25%] right-0 lg:right-8 xxl:right-0"
              onClick={() => swiperRef.current.slideNext()}
            >
              <FaAngleRight className="text-2xl" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelatedCategories;
