# sh curl-scripts/url-encoded/sign-in.sh

curl "https://tic-tac-toe-wdi.herokuapp.com/sign-in" \
  --include \
  --request POST \
  --header "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode ''

echo
