"use client";

import SuccessSvg from "@/assets/images/svg/SuccessSvg";
import { useGetAllGlobalSettingQuery } from "@/redux/services/globalSetting/globalSettingApi";

const SuccessAnimation = () => {
  const { data: globalData } = useGetAllGlobalSettingQuery();
  return (
    <div>
      <SuccessSvg primaryColor={globalData?.results?.primaryColor} />
    </div>
  );
};

export default SuccessAnimation;
