import Slider from 'react-slick';
import Image from 'next/image';

export default function CustomSlickCarousel() {
const settings = {
  dots: true,
  infinite: true,
  speed: 800,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 4000,
  cssEase: 'ease-in-out',
  pauseOnHover: true,
};

  return (
    <div
      style={{
        width: '500px',
        height: '580px',
        borderBottomLeftRadius: '100px',
        overflow: 'hidden',
        margin: '0 auto',
      }}
    >
      <Slider {...settings}>
        <div>
          <Image
            src="/images/LandingCagtuImages/landing-1.avif"
            alt="Slide 1"
            width={500}
            height={580}
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div>
          <Image
            src="/images/LandingCagtuImages/landing-5.avif"
            alt="Slide 2"
            width={500}
            height={580}
            style={{ objectFit: "contain" }}
          />
        </div>
        <div>
          <Image
            src="/images/LandingCagtuImages/landing-3.webp"
            alt="Slide 3"
            width={500}
            height={580}
            style={{ objectFit: 'cover' }}
          />
        </div>
      </Slider>
    </div>
  );
}
