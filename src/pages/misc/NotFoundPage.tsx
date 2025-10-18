import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

export function NotFoundPage() {
  const err = useRouteError();
  const message = isRouteErrorResponse(err)
    ? `${err.status} ${err.statusText}`
    : "Not Found";
  return (
    <div className="min-h-[50vh] grid place-items-center text-center">
      <div>
        <h1 className="text-4xl font-bold mb-2">{message}</h1>
        <p className="text-slate-600 mb-4">
          The page you're looking for doesn't exist.
        </p>
        <Link className="underline" to="/">
          Go home
        </Link>
      </div>
    </div>
  );
}
