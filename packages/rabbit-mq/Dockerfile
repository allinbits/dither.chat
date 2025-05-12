FROM rabbitmq:latest

RUN rabbitmq-plugins enable rabbitmq_management
RUN echo "management_agent.disable_metrics_collector = false" > /etc/rabbitmq/conf.d/20-management_agent.disable_metrics_collector.conf
#RUN rabbitmqctl set_policy DLX "dither.*" '{"dead-letter-exchange": "dither-dlx"}' --apply-to queues --priority 7
#RUN rabbitmqctl set_policy PUSHBACK "dlx-queue" '{"dead-letter-exchange": "dither","message-ttl": 10000}' --apply-to queues --priority 7