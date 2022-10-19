import Image from "next/future/image";

// Apparently NextJS can't just preload images that not rendered yet, so we force him to do that with this hack
const ImagePreload: React.FC<{ images: number[] }> = ({ images }) => {
  return (
    <div className="do-not-look-here-please hidden absolute">
      <span>Damn why you looked here :(</span>
      {images.map((image) => (
        <Image
          key={image}
          width={256}
          height={256}
          src={`/api/image/${image}`}
          alt="shadow dimension"
          priority
        />
      ))}
    </div>
  );
};

export default ImagePreload;
