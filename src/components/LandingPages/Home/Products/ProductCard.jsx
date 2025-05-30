import { Tooltip } from "antd";
import Image from "next/image";
import { useMemo, useState } from "react";
import QuickViewHover from "../../Products/QuickViewHover";
import { useGetAllGlobalSettingQuery } from "@/redux/services/globalSetting/globalSettingApi";
import { formatImagePath } from "@/utilities/lib/formatImagePath";
import LinkButton from "@/components/Shared/LinkButton";
import QuickProductView from "@/components/Shared/Product/QuickProductView";
import { useSelector } from "react-redux";
import { useDeviceId } from "@/redux/services/device/deviceSlice";
import {
  useAddWishlistMutation,
  useGetSingleWishlistByUserQuery,
} from "@/redux/services/wishlist/wishlistApi";
import { useCurrentUser } from "@/redux/services/auth/authSlice";
import { toast } from "sonner";
import { TbHeart } from "react-icons/tb";
import {
  useAddCartMutation,
  useGetSingleCartByUserQuery,
} from "@/redux/services/cart/cartApi";
import Link from "next/link";
import { calculateDiscountPercentage } from "@/utilities/lib/discountCalculator";
import { IoCheckmark } from "react-icons/io5";
import { sendGTMEvent } from "@next/third-parties/google";
import { useGetSingleUserQuery } from "@/redux/services/auth/authApi";

const ProductCard = ({ item }) => {
  const { data: globalData } = useGetAllGlobalSettingQuery();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const deviceId = useSelector(useDeviceId);
  const user = useSelector(useCurrentUser);
  const [addCart] = useAddCartMutation();
  const [addWishlist] = useAddWishlistMutation();

  const { data: wishlistData } = useGetSingleWishlistByUserQuery(
    user?._id ?? deviceId
  );

  const { data: userData } = useGetSingleUserQuery(user?._id, {
    skip: !user?._id,
  });

  const { data: cartData } = useGetSingleCartByUserQuery(user?._id ?? deviceId);

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const addToWishlist = async (id) => {
    const data = {
      ...(user?._id ? { user: user._id } : { deviceId }),
      product: id,
    };

    const toastId = toast.loading("Adding to wishlist");

    try {
      const res = await addWishlist(data);
      if (res?.error) {
        toast.error(res?.error?.data?.errorMessage, { id: toastId });
      }
      if (res?.data?.success) {
        toast.success(res.data.message, { id: toastId });
      }
    } catch (error) {
      console.error("Failed to add item to wishlist:", error);
      toast.error("Failed to add item to wishlist.", { id: toastId });
    }
  };

  const addToCart = async () => {
    const data = {
      ...(user?._id ? { user: user._id } : { deviceId }),
      ...(user?._id && {
        userName: userData?.name,
        userNumber: userData?.number,
        userEmail: userData?.email,
      }),
      product: item?._id,
      name: item?.name,
      slug: item?.slug,
      quantity: 1,
      sku: item?.sku,
      price: item?.offerPrice > 0 ? item?.offerPrice : item?.sellingPrice,
    };

    const toastId = toast.loading("Adding to cart");

    try {
      const res = await addCart(data);
      if (res?.data?.success) {
        toast.success(res.data.message, { id: toastId });
        sendGTMEvent({ event: "addToCart", value: data });
      }
      if (res?.error) {
        toast.error(res?.error?.data?.errorMessage, { id: toastId });
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      toast.error("Failed to add item to cart.", { id: toastId });
    }
  };

  const discountPercentage = calculateDiscountPercentage(
    item?.sellingPrice,
    item?.offerPrice
  );

  const isItemInWishlist = useMemo(() => {
    return wishlistData?.some(
      (wishlistItem) => wishlistItem?.product?._id === item?._id
    );
  }, [wishlistData, item?._id]);

  return (
    <div className="relative group w-full lg:w-[200px] mx-auto h-[330px] lg:h-[360px] hover:shadow-xl duration-500 flex flex-col border border-gray-200 bg-white rounded-xl overflow-hidden">
      <Tooltip placement="top" title={"Add to Wishlist"}>
        <div
          className="absolute top-2 right-2 z-10 text-xl cursor-pointer hover:scale-110 duration-300 text-white p-1 bg-primary rounded-full"
          onClick={() => addToWishlist(item?._id)}
        >
          {isItemInWishlist ? <IoCheckmark /> : <TbHeart />}
        </div>
      </Tooltip>
      <div className="relative overflow-hidden rounded-t-xl">
        <Link href={`/products/${item?.slug}`}>
          <Image
            src={
              item?.mainImage
                ? formatImagePath(item?.mainImage)
                : "https://thumbs.dreamstime.com/b/demo-demo-icon-139882881.jpg"
            }
            alt={item?.name}
            width={200}
            height={220}
            className="rounded-t-xl w-full lg:w-[200px] h-[160px] lg:h-[220px] group-hover:scale-110 duration-500"
            priority
          />
        </Link>
        <div className="hidden lg:block absolute inset-x-0 bottom-0 transform translate-y-full group-hover:translate-y-0 duration-500 z-10">
          <QuickViewHover item={item} />
        </div>
        <div className="lg:hidden">
          <QuickViewHover item={item} />
        </div>
        {discountPercentage > 0 && (
          <p className="text-xs font-medium absolute top-2 bg-blue-500 text-white left-2 p-1 rounded-xl">
            {discountPercentage}% Off
          </p>
        )}
      </div>

      <div className="px-2">
        <div>
          <LinkButton href={`/products/${item?.slug}`}>
            <Tooltip placement="top" title={item?.name}>
              <h2 className="text-sm text-start md:text-[15px] mt-2 lg:mt-3 hover:text-gray-500 duration-300 mb-1">
                {item?.name.length > 40
                  ? item.name.slice(0, 40).concat("...")
                  : item.name}
              </h2>
            </Tooltip>
          </LinkButton>
        </div>
        {item?.weight && item?.weight > 0 && (
          <p className="text-xs text-black/60 mt-1">
            {item?.weight} {"KG"}
          </p>
        )}
      </div>
      <div>
        <div className="flex justify-between items-center mb-2 px-2 absolute bottom-0 w-full">
          <div>
            {item?.offerPrice > 0 && (
              <p className="text-xs line-through text-black/60">
                {globalData?.results?.currency + " " + item?.sellingPrice}
              </p>
            )}
            {item?.offerPrice > 0 ? (
              <p className="text-black text-xs lg:text-base text-primary font-medium">
                {globalData?.results?.currency + " " + item?.offerPrice}
              </p>
            ) : (
              <p className="text-black text-xs lg:text-base text-primary font-medium">
                {globalData?.results?.currency + " " + item?.sellingPrice}
              </p>
            )}
          </div>
          <div className="text-center text-[9px]">
            {!item?.stock > 0 ? (
              <div className="text-red-500">(Out Of Stock)</div>
            ) : (
              <div className="text-green-500">(In Stock)</div>
            )}
          </div>

          <div>
            {item?.isVariant || item?.variants?.length > 0 ? (
              <div
                className={`${
                  cartData?.some(
                    (cartItem) => cartItem?.productId === item?._id
                  )
                    ? "bg-transparent text-primary hover:bg-primary hover:text-white"
                    : "bg-primary hover:bg-transparent text-white hover:text-primary"
                } border border-primary duration-300 px-2 lg:px-4 py-2 rounded-xl text-xs lg:text-sm`}
              >
                <LinkButton href={`/products/${item?.slug}`}>
                  <div>Details</div>
                </LinkButton>
              </div>
            ) : (
              <button
                onClick={addToCart}
                className={`${
                  cartData?.some(
                    (cartItem) => cartItem?.productId === item?._id
                  )
                    ? "bg-transparent text-primary hover:bg-primary hover:text-white"
                    : "bg-primary hover:bg-transparent text-white hover:text-primary"
                } border border-primary duration-300 px-2 lg:px-4 py-2 rounded-xl text-xs lg:text-sm`}
              >
                {cartData?.some((cartItem) => cartItem?.productId === item?._id)
                  ? "Added"
                  : "Add"}
              </button>
            )}
          </div>
        </div>
      </div>

      <QuickProductView
        item={item}
        isModalVisible={isModalVisible}
        handleModalClose={handleModalClose}
      />
    </div>
  );
};

export default ProductCard;
