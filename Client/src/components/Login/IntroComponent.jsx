import LoginSvg from "../../assets/logo1.png";

const IntroComponent = () => {
  return (
    <div className="hidden md:flex flex-col items-center justify-center gap-2">
      <p className="text-xl md:text-4xl mr-5">Welcome to Staff Proof!</p>
      <img
        src={LoginSvg}
        alt="Login SVG Icon"
        className="hidden cb1:block md:w-100 md:h-100 mt-7"
      />
    </div>
  );
};

export default IntroComponent;
