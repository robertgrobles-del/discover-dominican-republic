import { Navigate, useSearchParams } from "react-router-dom";

export default function MICEBodas() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");

  if (type === "boda") {
    return <Navigate to="/bodas" replace />;
  }

  return <Navigate to="/mice" replace />;
}
