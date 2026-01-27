
import { Postcard, Friend, ExchangeRecord } from './types';

export const MOCK_POSTCARDS: Postcard[] = [
  {
    id: '1',
    title: '中央公園噴泉',
    location: '紐約',
    country: '美國',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeBBPHD02ooQ7FLejVhZA1BIkBU3nQipWePycfcREz6LFiDssqPAzFVNXi_Qbz8SWnmcNuMg7d5G92a9GQoow5g8PS1RpVMT6PZ_0zFtvLIefcY5VHO_i6QjtmhaFQYvGULycHrmqs4knsjmuZ69Wl7mxGmddBZDwjdUvqrKTa_oI8ktJI91G0XieDwbTQMrlbNmZV3uEYjb7BkXdnASyRIrZp2DmkWtaJSuY7Q5FPgV5otpu8AgAPw5LZjN8d9mJbmmmoxMhLydT8',
    date: '2023年10月24日',
    description: '紅色和藍色皮克敏在花園附近發現了這個地方。他們似乎很喜歡噴泉的景色！',
    color: '#ef4444',
    isFavorite: false,
    sentTo: 'Olimar',
    category: '蘑菇'
  },
  {
    id: '2',
    title: '街角烘焙坊',
    location: '巴黎',
    country: '法國',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIELrikjMHRyv2NZvaLnAH6jnfYqT4g1q0dfqCyv6P1T9MobVEebBHfgZBLHOqWowLxOh-10MIw_p5GE7TF9cjb0DDrOd2kDTEwHe6KHZlN_35mIi8RRA_yIS4eKu8FBKQvlE96WmziqljFKWOOmd-yGi4L99JY-_I-MPsh7jq7zxEde4kDB-PDFBxWROfgK0OO6sSxecWvCCswnIhfmdwhqMyp6Wg1aH3dd45skWjqJ0nikE4ZCUdYa1ek1DP1MTvbgRniC0Rn1Ld',
    date: '2023年11月12日',
    description: '這裡充滿了可頌的香氣。',
    color: '#3b82f6',
    isFavorite: true,
    category: '探險'
  },
  {
    id: '3',
    title: '艾菲爾鐵塔',
    location: '巴黎',
    country: '法國',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvoTvLFFTCsKDrX8b1KwTLZfXiEITquNJCg6S6aaPviQvmbVIpXaGyGhtpK5c9jt3WjJ1DP3pT0Fa3fOzg8uA-OjTtKbr3khwPXcaCwDQynBD9BkS3FuDzDu2ig52uyabLE7zQcg9ocZT23R0NT92rjpGcKR509p8GVUhWWJT56qVHqBglITCHN1V5sOg1zxcx43UwQppjNteiW6bhhy7TXG_B-cEoQlDfcSnt2IXQxwhzJYLgXJHPmxhsE3HiZtZv5UMAaDmF-jMs',
    date: '2023年10月24日',
    description: '紅色和藍色皮克敏在花園附近發現了這個地方。他們似乎很喜歡巴黎鐵塔的景色！這是一份很棒的旅行紀念。',
    color: '#ef4444',
    isSpecial: true,
    isFavorite: false,
    category: '花瓣'
  },
  {
    id: '4',
    title: '東京鐵塔',
    location: '東京',
    country: '日本',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCunFt-hECuPgaJ_Dx-5UiD1dqUsrvKcvyxPQT7mbQ84FV_qkvVkA4s7f9iJE__iZBM3MV8mJmLRB3cgIo0npIDqFzKnD49nVGyD_g1KVQPhMtAakHdSzPL4Vg6Ij0jPN4eUmkOH5CvHhWhaW___nRfeqsqBw_8Mz0TFINjFeM2mF-9VXoDspm0HHHyNE0SsAOIcp0bChcffGR4GIlg0Ck0WOJ48IeQYHQBZr5x_zx8cWvFakSmLG_DBIY5GI-xwf6W8kZRJQF1sVzD',
    date: '2023年12月05日',
    description: '夕陽下的紅色高塔。',
    color: '#facc15',
    isFavorite: false,
    category: '探險'
  },
  {
    id: '5',
    title: '嵐山竹林',
    location: '京都',
    country: '日本',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt8s4FDZlhxZmB-Pdea1nOkel8QMZDfQe__lX-HlPjyGJNHubq8UVSiTcOQEgvC4lUi3eNMEB1ZfkYzdpr6aHAHCDORt6X3ULK3sL6wuRzb32RHtrzO59gZz5AciRlxuQWs4Hf0FUc5FsY_rvBeZfZzPG-N2jkXNjmTv3IFTpBpVIfZm8P-tBKYmG0akdeTBZvHn7L78eaqidzorGgIHNCJcjoon0vB34XOkacExmQMf8TTTpDH-e91pfKQiuzztoAlB8djEE0YVlU',
    date: '2024年01月10日',
    description: '幽靜的竹林小徑。',
    color: '#9333ea',
    isFavorite: false,
    category: '蘑菇'
  },
  {
    id: '6',
    title: '大笨鐘',
    location: '倫敦',
    country: '英國',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiuTlQofVSv4DU4IwJhi75YdMu0SgK22rY1lcXYL3uG_VycPa9ovRDzvkVp6AHGUS22BsNZga6Ybv78S48B3HqNhskF2tXyzypSGySuPr8WurB2bEMxevKN9WuXpTbZ-SQzyGbUTQPn2j1ZoA0utyAjDhpoeuu0k0fBkpxsXeXqxmlukUMrn0jU_MNKgTJqETXGfr_gNwoRrcvCiCTkbIkw_wQBRfJHtako_NEza4ciAYyiA75CJy3sIhp7ZeRvqHDWAIpitFyoLuN',
    date: '2024年02月15日',
    description: '倫敦的地標建築。',
    color: '#ec4899',
    isFavorite: false,
    sentTo: 'Sarah Jenkins',
    category: '花瓣'
  }
];

export const MOCK_FRIENDS: Friend[] = [
  {
    id: 'f1',
    name: 'Olimar',
    lastActive: '2分鐘前活躍',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBIV5B80--mdnGKocWTM4fqLSHTTtW9TihRtNZSa6BRmtXFgdFig87qiIyAe7wBN7pZmsuCW00Sa2v7sBlSrWznE44E4IfXKipEiegW1jXUDHYbV3E2dcdAnquuz_HsATw6jko2b-LcPtP6TxJGalB1v4vwzHdo53BMKCR_UzfYPjKReMCzaXiUhoRn3SdOCIOuR86tv6ahDQR6zu6fKXRpkiYPvyxOWwKqFQP-zVdID0KBjfCah-IIzciBQzvtuy35P5vfGO-gjHO',
    recentSent: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCboh9WESKwZgvfzf33uSYeROw1bvUS-5NehHRBIjg0Ah2aZfOIqWADP8H0iLbWopRRk6yPavu340tgduA1V2_Ub1tkEVkkJRtCogugdqg0X-0_kAyRdNkSAVs2j8xVYvsx07IKKwdbwIy38HRuuQCPR7Xru-JB-0dllK9Gr4ybZ7ozkzoj4Ukejq63zxgZqoXtcNtOcWfCTD-oFpd-oXKea1EOr5Gj8aIv1yolOVs1mcmxjNWtpjT6h-fuSlLJaME2GR16v-t0C4Rw',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAXHyHtCPAqdPLENvONdkMpV87PqyuN2MqERYIDIFSpEgRq1awXWu4HymN7I9hR0BUe7_3AxYbOCaFP869fWKOcRCgfJH0gtSfuWyygG4Y5gkNSEkd0QM-T4JHFVBY7u87-HVTmSt2WAyxb7PoNA4tFvFXOS_MBI5HASvZb41RNLBXj_ATsBkWgfoF6S5h7Blq6KgFowxdr6KUzMkShmfxnSd5TQ4SaUphJeqSYeqdTGeecum_dGxOwSilYVY5nAtX__z6XjdLKjhXT'
    ],
    isFavorite: true
  },
  {
    id: 'f2',
    name: 'Louie',
    lastActive: '5小時前活躍',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUn1ATD8KxOQS9lD4EuG5_Fg12dJZ6nRzOE5T024caLWcXYNQQ8L0E7dbwvqZUuB0toSDk4mK8VUQpsN89DEsPscL8XbtsALXdisPXwIHYOiJhnSLGw4wNBmc8n2NgNhyE7fc6WGGy28rFOtn_gx6MU0Fj5a2ONi-LKHQNHWQOL7QuVma2CLoOELGxRcl8qKvvlKDWQy0ZHuvvznEKLFP8zEvT0ecRZm-ruA0Wa64LVEFYX0GoUg-dbzTXDZwSaTnowkvJFPLNfmHh',
    recentSent: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCvhvDLZpIrB1TgzBY-mIWe6eKUAtRGqID-mBa2TdTCsDj0jCizrIQDVXEbVOZIAAxT7ZPWtPzsQLC6E6lXTeFEJQAebGooYDrHyZYWrWHXEZQkLj63qriu1enakHZVgkwj9PQL6KXnYFXchKwOcNp6VYJ60_Sq44IAU4FtV170_Jkh8kzaPnonBCRJ3hF4nANrfcmD31A_vRwM9QmJIDfQLRk8t7-KxQtCtq21krSvAfvbMM9ibyQ5P9P6QJQsJ-ceY5ApJ2AgLQlR'
    ],
    isFavorite: false
  },
  {
    id: 'f3',
    name: 'Chacho',
    lastActive: '2天前活躍',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDF1C-8WXZpTeeIh39aTleSRJ_SwkJKgQrDu0vD4_FtT5pncMS2YvUUJ5vsUn_Sg6g_QOzjOxwbLEbQqfpWjF2_qGeoX-T2ircIK-ip7ivU2iJ1UmSM-NPu4pgZ5tOxyGJ9yAc1Mb4bE4FyGSNY4U6LgR1QvWudHcSSNBzIKI6ZU9bk_Kc4JB4tbMVOfFXLs_YgJHF_IfHqos9plYmGz-h9uvnboKzEPumnQP13iKESeeJS7BOh70iwi-tCX0fI-W2uOWOz4b6UdAX_',
    recentSent: [],
    isFavorite: false
  }
];

export const MOCK_RECORDS: ExchangeRecord[] = [
  // Louie 收過的明信片（我寄給他的）
  {
    id: 'r1',
    friendId: 'f2',
    friendName: 'Louie',
    friendAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUn1ATD8KxOQS9lD4EuG5_Fg12dJZ6nRzOE5T024caLWcXYNQQ8L0E7dbwvqZUuB0toSDk4mK8VUQpsN89DEsPscL8XbtsALXdisPXwIHYOiJhnSLGw4wNBmc8n2NgNhyE7fc6WGGy28rFOtn_gx6MU0Fj5a2ONi-LKHQNHWQOL7QuVma2CLoOELGxRcl8qKvvlKDWQy0ZHuvvznEKLFP8zEvT0ecRZm-ruA0Wa64LVEFYX0GoUg-dbzTXDZwSaTnowkvJFPLNfmHh',
    date: '2023年12月15日',
    postcardTitle: '東京鐵塔',
    postcardImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCunFt-hECuPgaJ_Dx-5UiD1dqUsrvKcvyxPQT7mbQ84FV_qkvVkA4s7f9iJE__iZBM3MV8mJmLRB3cgIo0npIDqFzKnD49nVGyD_g1KVQPhMtAakHdSzPL4Vg6Ij0jPN4eUmkOH5CvHhWhaW___nRfeqsqBw_8Mz0TFINjFeM2mF-9VXoDspm0HHHyNE0SsAOIcp0bChcffGR4GIlg0Ck0WOJ48IeQYHQBZr5x_zx8cWvFakSmLG_DBIY5GI-xwf6W8kZRJQF1sVzD',
    type: 'sent',
    status: 'delivered'
  },
  {
    id: 'r1b',
    friendId: 'f2',
    friendName: 'Louie',
    friendAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUn1ATD8KxOQS9lD4EuG5_Fg12dJZ6nRzOE5T024caLWcXYNQQ8L0E7dbwvqZUuB0toSDk4mK8VUQpsN89DEsPscL8XbtsALXdisPXwIHYOiJhnSLGw4wNBmc8n2NgNhyE7fc6WGGy28rFOtn_gx6MU0Fj5a2ONi-LKHQNHWQOL7QuVma2CLoOELGxRcl8qKvvlKDWQy0ZHuvvznEKLFP8zEvT0ecRZm-ruA0Wa64LVEFYX0GoUg-dbzTXDZwSaTnowkvJFPLNfmHh',
    date: '2024年01月05日',
    postcardTitle: '嵐山竹林',
    postcardImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt8s4FDZlhxZmB-Pdea1nOkel8QMZDfQe__lX-HlPjyGJNHubq8UVSiTcOQEgvC4lUi3eNMEB1ZfkYzdpr6aHAHCDORt6X3ULK3sL6wuRzb32RHtrzO59gZz5AciRlxuQWs4Hf0FUc5FsY_rvBeZfZzPG-N2jkXNjmTv3IFTpBpVIfZm8P-tBKYmG0akdeTBZvHn7L78eaqidzorGgIHNCJcjoon0vB34XOkacExmQMf8TTTpDH-e91pfKQiuzztoAlB8djEE0YVlU',
    type: 'sent',
    status: 'delivered'
  },
  {
    id: 'r1c',
    friendId: 'f2',
    friendName: 'Louie',
    friendAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUn1ATD8KxOQS9lD4EuG5_Fg12dJZ6nRzOE5T024caLWcXYNQQ8L0E7dbwvqZUuB0toSDk4mK8VUQpsN89DEsPscL8XbtsALXdisPXwIHYOiJhnSLGw4wNBmc8n2NgNhyE7fc6WGGy28rFOtn_gx6MU0Fj5a2ONi-LKHQNHWQOL7QuVma2CLoOELGxRcl8qKvvlKDWQy0ZHuvvznEKLFP8zEvT0ecRZm-ruA0Wa64LVEFYX0GoUg-dbzTXDZwSaTnowkvJFPLNfmHh',
    date: '2024年02月20日',
    postcardTitle: '艾菲爾鐵塔',
    postcardImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvoTvLFFTCsKDrX8b1KwTLZfXiEITquNJCg6S6aaPviQvmbVIpXaGyGhtpK5c9jt3WjJ1DP3pT0Fa3fOzg8uA-OjTtKbr3khwPXcaCwDQynBD9BkS3FuDzDu2ig52uyabLE7zQcg9ocZT23R0NT92rjpGcKR509p8GVUhWWJT56qVHqBglITCHN1V5sOg1zxcx43UwQppjNteiW6bhhy7TXG_B-cEoQlDfcSnt2IXQxwhzJYLgXJHPmxhsE3HiZtZv5UMAaDmF-jMs',
    type: 'sent',
    status: 'delivered'
  },
  // Olimar 收過的明信片（我寄給他的）
  {
    id: 'r2',
    friendId: 'f1',
    friendName: 'Olimar',
    friendAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBIV5B80--mdnGKocWTM4fqLSHTTtW9TihRtNZSa6BRmtXFgdFig87qiIyAe7wBN7pZmsuCW00Sa2v7sBlSrWznE44E4IfXKipEiegW1jXUDHYbV3E2dcdAnquuz_HsATw6jko2b-LcPtP6TxJGalB1v4vwzHdo53BMKCR_UzfYPjKReMCzaXiUhoRn3SdOCIOuR86tv6ahDQR6zu6fKXRpkiYPvyxOWwKqFQP-zVdID0KBjfCah-IIzciBQzvtuy35P5vfGO-gjHO',
    date: '2024年01月02日',
    postcardTitle: '中央公園噴泉',
    postcardImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeBBPHD02ooQ7FLejVhZA1BIkBU3nQipWePycfcREz6LFiDssqPAzFVNXi_Qbz8SWnmcNuMg7d5G92a9GQoow5g8PS1RpVMT6PZ_0zFtvLIefcY5VHO_i6QjtmhaFQYvGULycHrmqs4knsjmuZ69Wl7mxGmddBZDwjdUvqrKTa_oI8ktJI91G0XieDwbTQMrlbNmZV3uEYjb7BkXdnASyRIrZp2DmkWtaJSuY7Q5FPgV5otpu8AgAPw5LZjN8d9mJbmmmoxMhLydT8',
    type: 'sent',
    status: 'delivered'
  },
  {
    id: 'r2b',
    friendId: 'f1',
    friendName: 'Olimar',
    friendAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBIV5B80--mdnGKocWTM4fqLSHTTtW9TihRtNZSa6BRmtXFgdFig87qiIyAe7wBN7pZmsuCW00Sa2v7sBlSrWznE44E4IfXKipEiegW1jXUDHYbV3E2dcdAnquuz_HsATw6jko2b-LcPtP6TxJGalB1v4vwzHdo53BMKCR_UzfYPjKReMCzaXiUhoRn3SdOCIOuR86tv6ahDQR6zu6fKXRpkiYPvyxOWwKqFQP-zVdID0KBjfCah-IIzciBQzvtuy35P5vfGO-gjHO',
    date: '2024年03月08日',
    postcardTitle: '大笨鐘',
    postcardImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiuTlQofVSv4DU4IwJhi75YdMu0SgK22rY1lcXYL3uG_VycPa9ovRDzvkVp6AHGUS22BsNZga6Ybv78S48B3HqNhskF2tXyzypSGySuPr8WurB2bEMxevKN9WuXpTbZ-SQzyGbUTQPn2j1ZoA0utyAjDhpoeuu0k0fBkpxsXeXqxmlukUMrn0jU_MNKgTJqETXGfr_gNwoRrcvCiCTkbIkw_wQBRfJHtako_NEza4ciAYyiA75CJy3sIhp7ZeRvqHDWAIpitFyoLuN',
    type: 'sent',
    status: 'delivered'
  }
];
