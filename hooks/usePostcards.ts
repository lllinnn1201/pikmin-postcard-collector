// 明信片資料 Hook
// 透過 Context 存取全域明信片狀態

import { usePostcardsContext } from '../contexts/PostcardContext';

export const usePostcards = () => {
    return usePostcardsContext();
};
