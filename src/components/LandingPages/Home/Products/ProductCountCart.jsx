"use client";

import { SubmitButton } from "@/components/Reusable/Button/CustomButton";
import { useCurrentUser } from "@/redux/services/auth/authSlice";
import { useAddCartMutation } from "@/redux/services/cart/cartApi";
import { Modal } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaPlus, FaMinus, FaCartShopping } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const ProductCountCart = ({
  item,
  single,
  handleModalClose = () => {},
  fullWidth,
}) => {
  const router = useRouter();
  const [count, setCount] = useState(1);
  const [openVariantModal, setOpenVariantModal] = useState(false);

  const user = useSelector(useCurrentUser);
  const [addCart, { isLoading }] = useAddCartMutation();

  const handleCount = (action) => {
    if (action === "increment") {
      setCount((prev) => prev + 1);
    } else if (action === "decrement") {
      if (count > 1) {
        setCount((prev) => prev - 1);
      } else {
        toast.error("Count cannot be less than one");
      }
    }
  };

  const [selectedVariant, setSelectedVariant] = useState(null);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  const addToCart = async (type) => {
    if (item?.variants?.length > 0 && !selectedVariant) {
      setOpenVariantModal(true);
      return;
    }
    if (!user) {
      toast.error("Please login to add to cart.");
      return;
    }

    const data = {
      user: user?._id,
      product: item?._id,
      quantity: count,
      price: selectedVariant?.sellingPrice
        ? selectedVariant?.sellingPrice
        : item?.offerPrice
        ? item?.offerPrice
        : item?.sellingPrice,
    };

    const toastId = toast.loading("Adding to cart");

    console.log(type);

    try {
      const res = await addCart(data);
      if (res?.data?.success) {
        toast.success(res.data.message, { id: toastId });
        handleModalClose();
        setCount(1);
        setOpenVariantModal(false);
        if (type === "buy") {
          router.push("/cart");
        }
      }
      if (res?.error) {
        toast.error(res?.error?.data?.errorMessage, { id: toastId });
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      toast.error("Failed to add item to cart.", { id: toastId });
    }
  };
  return (
    <div
      className={`mt-5 lg:mt-10 ${
        single
          ? "gap-5 flex flex-col lg:flex-row items-center"
          : "flex items-center justify-between gap-5"
      }`}
    >
      <div className="flex items-center gap-3 border border-primaryLight rounded-xl p-1.5">
        <button
          className="cursor-pointer bg-primaryLight p-2 rounded text-xl"
          onClick={() => handleCount("decrement")}
        >
          <FaMinus />
        </button>
        <span className="text-base font-bold text-textColor">{count}</span>
        <button
          className="cursor-pointer bg-primaryLight p-2 rounded text-xl"
          onClick={() => handleCount("increment")}
        >
          <FaPlus />
        </button>
      </div>
      <SubmitButton
        func={() => addToCart("cart")}
        text={"Add"}
        icon={<FaCartShopping />}
        loading={isLoading}
        fullWidth={fullWidth}
      />
      <SubmitButton
        func={() => addToCart("buy")}
        text={"Buy Now"}
        icon={<FaCartShopping />}
        loading={isLoading}
        fullWidth={fullWidth}
      />
      <Modal
        open={openVariantModal}
        onCancel={() => setOpenVariantModal(false)}
        footer={null}
        centered
      >
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-2 justify-center items-center mb-4">
            <span className="font-bold">Select Variant:</span>
            <div className="flex items-center gap-2">
              {item?.variants?.map((variant) => (
                <div
                  key={variant._id}
                  onClick={() => handleVariantSelect(variant)}
                  className={`cursor-pointer size-10 rounded-full border-4 ${
                    selectedVariant?._id === variant._id
                      ? "border-primary"
                      : "border-gray-300"
                  }`}
                  title={variant?.attributeCombination[0]?.label}
                  style={{
                    backgroundColor: variant?.attributeCombination[0]?.label,
                  }}
                >
                  {" "}
                  {variant?.attributeCombination[0]?.type === "other" && (
                    <span className="text-black flex items-center justify-center mt-1 font-bold">
                      {variant?.attributeCombination[0]?.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <SubmitButton
            func={addToCart}
            text={"Add"}
            icon={<FaCartShopping />}
            loading={isLoading}
            fullWidth={fullWidth}
          />
          <SubmitButton
            func={addToCart}
            text={"Buy Now"}
            icon={<FaCartShopping />}
            loading={isLoading}
            fullWidth={fullWidth}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ProductCountCart;
