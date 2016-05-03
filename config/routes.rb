Rails.application.routes.draw do
  get 'application/index'
  post 'application/analyse'
  post 'application/show_word_details'
  post 'application/search'
  root 'application#index'
end
