
# İzlenme Popülerliği Algoritması

Bu algoritma, YouTube videolarının popülerliğini günlük izlenme oranlarına göre puanlamak amacıyla geliştirilmiştir. Amaç, kullanıcıların listelenen videolar arasında en popüler olanları hızlı bir şekilde tespit edebilmesini sağlamaktır.

## Algoritma Mantığı

1. **Günlük İzlenme Oranı Hesaplama**  
   Algoritma, bir videonun toplam izlenme sayısını (viewCount) yayınlanma tarihi ile bugünkü tarih arasındaki farkla böler. Bu, videonun günlük ortalama izlenme oranını (viewsPerDay) hesaplamayı sağlar:
   ```
   viewsPerDay = viewCount / diffDays
   ```

2. **Referans Günlük İzlenme Oranı**  
   Her video, sabit bir referans günlük izlenme oranına (500,000) göre değerlendirilir. Bu değer, popüler bir videonun günlük ortalama izlenme oranını temsil eder.

3. **Puanlama Sistemi**  
   Günlük izlenme oranı, referans izlenme oranına bölünerek bir çarpan hesaplanır ve bu çarpan 10 ile çarpılarak bir ham puan (rawScore) elde edilir:
   ```
   rawScore = (viewsPerDay / referenceViewsPerDay) * 10
   ```

   Ham puan, `0` ile `10` arasında normalize edilir. Nihai puan:
   ```
   score = Math.min(Math.max(Math.round(rawScore), 0), 10)
   ```

## Algoritmanın Avantajları

- **Basit ve Anlaşılır**: Statik bir referans noktası kullanarak puanlama yapar.
- **Dinamik Günlük İzlenme Oranı**: Videoların zamana göre popülerliğini adil bir şekilde değerlendirir.
- **Genel Ölçeklendirme**: Tüm videolar sabit bir referansa göre değerlendirildiğinden, sonuçlar tutarlıdır.

## Proje İçerisinde Kullanımı

Bu algoritma, YouTube ana sayfasında listelenen videolar için aşağıdaki gibi çalışır:

1. **Veri Toplama**: Video elementlerinden izlenme sayısı ve yüklenme tarihi bilgisi alınır.
2. **Puanlama**: Algoritma her bir video için günlük izlenme oranını ve puanını hesaplar.
3. **Görselleştirme**: Puanlar, her video elementine uygun bir renklendirme ile eklenir.
4. **Dinamik Güncellemeler**: Sayfa kaydırıldıkça (scroll), yeni gelen videolar için algoritma yeniden çalıştırılır.

### Örnekler

| Video İzlenme Sayısı | Yayın Tarihi (Gün) | Günlük İzlenme Oranı | Puan |
|-----------------------|--------------------|-----------------------|------|
| 12 B                 | 4 gün önce         | 3,000                | 1    |
| 28 B                 | 1 gün önce         | 28,000               | 6    |
| 5 Mn                 | 10 gün önce        | 500,000              | 10   |

Bu algoritma, popülerlik sıralamasını optimize eder ve kullanıcıların dikkatini en popüler içeriklere çeker.
