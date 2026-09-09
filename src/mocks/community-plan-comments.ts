// Mock data — comments per CommunityPlan id. Not sourced from any real API
// (see README, no-backend phase). Not every plan has comments, on purpose —
// it lets the screen show its empty state too.
export type CommunityPlanComment = {
  id: string;
  author: string;
  text: string;
};

export const mockCommunityPlanComments: Record<string, CommunityPlanComment[]> = {
  'plan-1': [
    { id: 'comment-1', author: 'Antonio Gómez', text: '¿Hay que llevar bastones o los prestáis?' },
    {
      id: 'comment-2',
      author: 'Rocío Cabrera',
      text: 'Yo llevo los míos de sobra, si a alguien le hacen falta.',
    },
  ],
  'plan-2': [
    {
      id: 'comment-3',
      author: 'Lucía Fernández',
      text: '¿Se puede traer tela propia o la ponéis vosotros?',
    },
  ],
  'plan-6': [
    {
      id: 'comment-4',
      author: 'Javier Ortega',
      text: '¿A qué hora abre la zona de avituallamiento?',
    },
    { id: 'comment-5', author: 'Marta Ruiz', text: 'Nos vemos allí, ¡qué ganas!' },
  ],
};
