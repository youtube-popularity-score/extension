
# View Popularity Algorithm

This algorithm is designed to rank YouTube videos based on their daily view rates, allowing users to quickly identify the most popular videos among those listed.

## Algorithm Logic

1. **Daily View Rate Calculation**  
   The algorithm calculates the average daily views (viewsPerDay) of a video by dividing its total views (viewCount) by the difference in days between the upload date and the current date:
   ```
   viewsPerDay = viewCount / diffDays
   ```

2. **Reference Daily View Rate**  
   Each video is compared to a fixed reference daily view rate of `500,000`, representing the average daily views of a popular video.

3. **Scoring System**  
   The daily view rate is divided by the reference view rate, and the resulting ratio is multiplied by `10` to produce a raw score:
   ```
   rawScore = (viewsPerDay / referenceViewsPerDay) * 10
   ```

   The raw score is normalized between `0` and `10`:
   ```
   score = Math.min(Math.max(Math.round(rawScore), 0), 10)
   ```

## Advantages of the Algorithm

- **Simple and Understandable**: Uses a static reference point for scoring.
- **Dynamic Daily View Rate**: Fairly evaluates videos based on their popularity over time.
- **Consistent Scaling**: All videos are judged against a common reference, ensuring consistency.

## Integration in the Project

This algorithm works as follows for videos listed on the YouTube homepage:

1. **Data Collection**: Fetches view count and upload date information from video elements.
2. **Scoring**: Calculates the daily view rate and score for each video.
3. **Visualization**: Appends scores to video elements with appropriate color coding.
4. **Dynamic Updates**: Recomputes and renders scores for new videos as they load during scrolling.

### Examples

| Video View Count | Upload Date (Days) | Daily View Rate | Score |
|-------------------|--------------------|-----------------|------|
| 12K              | 4 days ago         | 3,000           | 1    |
| 28K              | 1 day ago          | 28,000          | 6    |
| 5M               | 10 days ago        | 500,000         | 10   |

This algorithm optimizes popularity ranking and highlights the most engaging content for users.
