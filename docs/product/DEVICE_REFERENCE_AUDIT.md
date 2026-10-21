# Device reference and calibration audit

This audit records the sample-photo evidence used to tune physical-camera
presets. Each link points to original camera samples, a contemporaneous review,
or a camera manual that explains the sample conditions and output. The profiles
are visual approximations: exposure, focus, firmware, JPEG settings, and scene
content can change the look of two photographs from the same camera.

## Noise rules

`midtoneNoiseFloor` sets the minimum brightness-dependent luma and chroma noise
weight outside the sensor's strongest midtone response. A lower value prevents
noise from spreading evenly across normal-lit surfaces. `detailNoiseSuppression`
reduces added noise in 3 × 3 neighborhoods with strong luminance or color detail.
It is a texture heuristic, not subject or focus recognition. `lumaNoise` and
`chromaNoise` scale the remaining noise; higher values do not imply noise should
be equally visible at every brightness or on every detail.

| Device                    | Sample-photo evidence                                                                                                                                                                                                                                                                             | Observed signature and profile decision                                                                                                                                                                           | Noise floor / detail mask |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------: |
| Nokia 7650 (2002)         | [2002 review and VGA camera samples](https://www.cellularitalia.com/prove/nokia_7650.php); [photo captured on a Nokia 7650](https://www.digitalcameraworld.com/tech/phones/travel-back-to-2001-and-the-dawn-of-the-camera-phone)                                                                  | The 640 × 480 ceiling, soft optics, and early JPEG limit detail. Reduced the previously very high noise amplitudes and concentrated more of the remaining texture in shadows.                                     |               0.38 / 0.04 |
| Nokia 3660 (2003)         | [Nokia manual: standard and night photos save at 640 × 480](https://www.telefonguru.hu/manuals/nokia_3660_en.pdf); [original Flickr photo identified as Nokia 3660](https://www.flickr.com/photos/tarunactivity/685929908/)                                                                       | Kept the VGA softness and mild color while lowering the broad midtone noise floor. Detail suppression stays very light because the reference does not establish a modern detail-aware denoiser.                   |               0.42 / 0.06 |
| Nokia N95 (2007)          | [Full-size original N95 samples and processing notes](https://allaboutsymbian.com/features/item/A_spot_of_sun-Testing_the_Nokia_N95.php); [camera review with original-size samples](https://www.mobiletechreview.com/phones/Nokia-N95-page-2.htm)                                                | Original samples and reviews describe strong edge enhancement with noise reduction; preserved its sharpening character while lowering blanket noise and adding modest local suppression.                          |               0.50 / 0.18 |
| Sony Ericsson C905 (2008) | [Full-size daylight, night, and flash camera samples](https://mobile-review.com/review/sonyericsson-c905-camera.shtml); [additional original-size C905 samples](https://www.telefon-treff.de/forum/thread/386100-sony-ericsson-c905-testbericht-des-neuen-cyber-shot-sliders-mit-vielen-bildern/) | Ordinary daylight images are comparatively clean for the period. Lowered base noise, retained its sharper Cyber-shot processing, and added restrained detail-aware noise reduction.                               |               0.48 / 0.22 |
| iPhone 3GS (2009)         | [Original 3GS sample album](https://www.flickr.com/photos/rmohns/albums/72157620552767413/); [contemporary camera review](https://www.gsmarena.com/apple_iphone_3gs-review-369p7.php)                                                                                                             | Kept the existing calibrated profile unchanged, including its patterned luma texture, detail suppression, and highlight clipping.                                                                                 |               0.76 / 0.78 |
| iPhone 4 (2010)           | [Same-scene iPhone 4 and 3GS camera review](https://arstechnica.com/gadgets/2010/06/iphone-4/); [low-light comparison and fine-grain notes](https://www.phonescoop.com/articles/article.php?a=387&p=2810)                                                                                         | The comparisons report cleaner low-light output than 3GS, with fine luminance grain and less color noise. Reduced both noise channels and kept the remaining grain mostly luminance-led.                          |               0.50 / 0.24 |
| iPhone 4S (2011)          | [4S sample-photo comparison with earlier iPhones](https://arstechnica.com/gadgets/2011/11/can-the-iphone-4s-replace-a-real-digital-camera-for-many-yes/); [full-resolution 4S sample photos](https://www.macrumors.com/2011/10/04/full-resolution-photos-from-the-new-iphone-4s-camera/)          | Review comparisons show improved dynamic range and less saturated reds than iPhone 4. Reduced contrast, shadow crush, and noise; moderate local suppression represents its smoother low-light detail.             |               0.46 / 0.40 |
| iPhone 5 (2012)           | [Unaltered iPhone 5 camera samples and low-light review](https://www.imore.com/iphone-5-camera-review); [camera review noting stronger low-light noise reduction](https://www.dpreview.com/reviews/1343713337/apple-iphone-5-review/)                                                             | Kept its stronger color while lowering broad noise. Increased detail-aware suppression to model the more active low-light noise reduction noted in reviews.                                                       |               0.40 / 0.58 |
| iPhone 5s (2013)          | [Original 5s photo gallery and review](https://www.dpreview.com/reviews/7518611407/apple-iphone5s-smartphone-camera-review/); [untouched phone JPEG samples](https://www.takebetterphotos.com.au/iphone5s-camera-review.html)                                                                     | Reviews describe light-handed noise reduction, preserved detail, and visible luminance noise in skies and shadows. Reduced overall noise but kept its midtone floor higher and its detail mask very low.          |               0.64 / 0.05 |
| Canon PowerShot G1 (2000) | [PowerShot G1 sample gallery and long-exposure noise tests](https://www.dpreview.com/reviews/4088819590/canong1/); [straight-out-of-camera G1 JPEG samples](https://www.reddit.com/r/VintageDigitalCameras/comments/1jkj2yv)                                                                      | Retained a modest CCD-era noise level. The documented dark-frame subtraction applies to long exposures, so the general preset does not invent hot pixels or apply that exposure-specific behavior to every image. |               0.46 / 0.12 |
| Canon EOS 300D (2003)     | [Production-camera review, sample photos, and JPEG parameter tests](https://www.dpreview.com/reviews/9752728624/canoneos300d/)                                                                                                                                                                    | Lowered sensor noise for the larger DSLR sensor. Modeled the default Parameter 1 JPEG with stronger contrast, saturation, and sharpening, as documented by the review.                                            |               0.30 / 0.02 |

## Limits and follow-up

The sources include full-resolution examples and historical reviews, but they
do not provide a controlled set of the same scene photographed by every camera
at matching exposure. The numeric profiles therefore express evidence-based
relative differences, not measured sensor specifications. Exact matching needs
original files with EXIF and comparable scenes; exposure metering, autofocus,
flash firing, and camera faults cannot be inferred reliably from an arbitrary
input image.

Flash appearance, CCD-versus-CMOS labels, portrait-thumbnail output, and JPEG
chroma subsampling are not modeled by the current processing code. Those
non-functional preset labels were removed so each remaining setting affects
the exported image.
