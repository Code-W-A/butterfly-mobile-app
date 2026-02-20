import React from 'react';
import StarRating from 'react-native-star-rating-widget';

import {Color} from '@common';

const StarRatingComponent = React.memo(({rating, onChange}) => {
  return (
    <StarRating
      rating={rating}
      onChange={onChange}
      disabled={false}
      maxStars={5}
      starSize={26}
      emptyStar="star-o"
      fullStar="star"
      starColor={Color.starRating}
      fullStarColor={Color.starRating}
      halfStarColor={Color.starRating}
      emptyStarColor="#ccc"
    />
  );
});

export default StarRatingComponent;
