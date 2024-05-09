## http-api

resource "aws_apigatewayv2_api" "weather_http_api" {
  name          = "weather_http_api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["http://localhost:3000"] 
    allow_methods = ["GET"] 
    allow_headers = ["Content-Type", "Authorization"] 
  }
}

resource "aws_apigatewayv2_stage" "qa_stage" {
  api_id      = aws_apigatewayv2_api.weather_http_api.id
  name        = "v1"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "weather_service_integration" {
  api_id = aws_apigatewayv2_api.weather_http_api.id

  integration_uri        = module.weather_service_lambda_function.lambda_function_arn
  integration_type       = "AWS_PROXY"
  integration_method     = "GET"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "weather_service_route_get_city_weather" {
  api_id = aws_apigatewayv2_api.weather_http_api.id

  route_key = "GET /weather/{city}"
  target    = "integrations/${aws_apigatewayv2_integration.weather_service_integration.id}"
}

resource "aws_apigatewayv2_route" "weather_service_route_get_city_weather_history" {
  api_id = aws_apigatewayv2_api.weather_http_api.id

  route_key = "GET /weather/history/{city}"
  target    = "integrations/${aws_apigatewayv2_integration.weather_service_integration.id}"
}

## api-gateway --> lambda
resource "aws_lambda_permission" "lambda_permission" {
  statement_id  = "AllowWeatherApiInvokeLambda"
  action        = "lambda:InvokeFunction"
  function_name = module.weather_service_lambda_function.lambda_function_name
  principal     = "apigateway.amazonaws.com"

  # The /* part allows invocation from any stage, method and resource path
  # within API Gateway.
  source_arn = "${aws_apigatewayv2_api.weather_http_api.execution_arn}/*"
}
