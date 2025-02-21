const Hero = () => (
  <section>
    <div className="rounded-full bg-white text-gray-400 font-semibold max-w-max mx-auto text-xs text-center py-1 px-4 mb-4">
      Part of a job application for{" "}
      <a
        className="cursor-pointer text-gray-500"
        href="https://finchat.io"
        target="_blank"
      >
        FinChat
      </a>
    </div>
    <h1 className="text-3xl font-semibold md:text-6xl text-center">
      Portfolio Health Analyzer
    </h1>
    <div className="font-medium text-right">
      by{" "}
      <a
        className="text-gray-400 cursor-pointer"
        href="https://harshturna.com"
        target="_blank"
      >
        Harsh
      </a>
    </div>
  </section>
);

export default Hero;
