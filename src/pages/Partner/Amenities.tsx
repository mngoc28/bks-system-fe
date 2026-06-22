import { Navigate } from 'react-router-dom';
import { ROUTERS } from '@/constant';

const Amenities: React.FC = () => {
  return <Navigate to={ROUTERS.PARTNER_CATALOG_AMENITIES} replace />;
};

export default Amenities;
