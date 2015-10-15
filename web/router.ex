defmodule SamplePhoenixReactApp.Router do
  use SamplePhoenixReactApp.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", SamplePhoenixReactApp do
    pipe_through :browser # Use the default browser stack

    get "/static/*paths", StaticController, :static
    get "/*paths", PageController, :index
  end

  # Other scopes may use custom stacks.
  # scope "/api", SamplePhoenixReactApp do
  #   pipe_through :api
  # end
end
