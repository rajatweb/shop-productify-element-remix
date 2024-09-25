import KanbanBoard from "@/components/kanban-board";
import { Banner, Link } from "@shopify/polaris";

const OrdersPage = () => {
  return (
    <div className="mx-10 pt-10">
      <div>
        <Banner
          title="To receive order data from a webhook, you need to manually configure the webhook."
        >
          <p>
            Please click the link below to access your store and configure the
            webhook: 
            <Link
              target="_blank"
              url="https://admin.shopify.com/store/hydrogen-web/settings/notifications/webhooks"
            >
              Your store Webhook
            </Link>
          </p>

          <p>
            Learn more: 
            <Link
              target="_blank"
              url="https://help.shopify.com/en/manual/fulfillment/setup/notifications/webhooks"
            >
              Shopify Webhook Setup Guide
            </Link>
          </p>
        </Banner>
      </div>
      <KanbanBoard />
    </div>
  );
};

export default OrdersPage;
