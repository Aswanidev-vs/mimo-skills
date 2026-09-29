/**
 * Event-driven communication bus for inter-agent messaging
 */

export class AgentCommunicationBus {
  constructor() {
    this.channels = new Map();
    this.messageQueue = new Map();
    this.subscribers = new Map();
    this.history = [];
  }

  /**
   * Create a channel for direct agent-to-agent communication
   */
  createChannel(channelName) {
    if (!this.channels.has(channelName)) {
      this.channels.set(channelName, {
        name: channelName,
        participants: new Set(),
        messages: []
      });
    }
    return this.channels.get(channelName);
  }

  /**
   * Subscribe to a channel
   */
  subscribe(agentId, channelName, callback) {
    const channel = this.createChannel(channelName);
    channel.participants.add(agentId);

    if (!this.subscribers.has(channelName)) {
      this.subscribers.set(channelName, new Map());
    }
    this.subscribers.get(channelName).set(agentId, callback);

    return () => this.unsubscribe(agentId, channelName);
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(agentId, channelName) {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.participants.delete(agentId);
    }
    const subs = this.subscribers.get(channelName);
    if (subs) {
      subs.delete(agentId);
    }
  }

  /**
   * Publish message to channel
   */
  publish(channelName, message) {
    const channel = this.createChannel(channelName);
    const fullMessage = {
      ...message,
      timestamp: Date.now(),
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    channel.messages.push(fullMessage);
    this.history.push({ channel: channelName, ...fullMessage });

    const subs = this.subscribers.get(channelName);
    if (subs) {
      for (const [agentId, callback] of subs) {
        if (agentId !== message.sender) {
          callback(fullMessage);
        }
      }
    }

    return fullMessage;
  }

  /**
   * Direct agent-to-agent message
   */
  sendToAgent(fromAgent, toAgent, payload) {
    const directChannel = `direct:${fromAgent}->${toAgent}`;
    return this.publish(directChannel, {
      sender: fromAgent,
      receiver: toAgent,
      payload,
      type: 'direct'
    });
  }

  /**
   * Broadcast to all agents
   */
  broadcast(sender, payload, excludeSender = true) {
    const messages = [];
    for (const [channelName, channel] of this.channels) {
      if (!channelName.startsWith('direct:')) {
        const msg = this.publish(channelName, {
          sender,
          payload,
          type: 'broadcast',
          excludeSender
        });
        messages.push(msg);
      }
    }
    return messages;
  }

  /**
   * Request-response pattern
   */
  async request(fromAgent, toAgent, requestPayload, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const responseChannel = `response:${requestId}`;

      const timeout = setTimeout(() => {
        this.unsubscribe(fromAgent, responseChannel);
        reject(new Error(`Request timeout from ${fromAgent} to ${toAgent}`));
      }, timeoutMs);

      this.subscribe(fromAgent, responseChannel, (message) => {
        clearTimeout(timeout);
        this.unsubscribe(fromAgent, responseChannel);
        resolve(message.payload);
      });

      this.sendToAgent(fromAgent, toAgent, {
        requestId,
        responseChannel,
        payload: requestPayload,
        type: 'request'
      });
    });
  }

  /**
   * Respond to a request
   */
  respond(requestMessage, responsePayload) {
    if (requestMessage.type === 'request' && requestMessage.responseChannel) {
      return this.publish(requestMessage.responseChannel, {
        sender: requestMessage.receiver,
        receiver: requestMessage.sender,
        payload: responsePayload,
        type: 'response',
        requestId: requestMessage.requestId
      });
    }
    return null;
  }

  /**
   * Get message history for debugging
   */
  getHistory(filter = {}) {
    let messages = [...this.history];

    if (filter.channel) {
      messages = messages.filter(m => m.channel === filter.channel);
    }
    if (filter.sender) {
      messages = messages.filter(m => m.sender === filter.sender);
    }
    if (filter.receiver) {
      messages = messages.filter(m => m.receiver === filter.receiver);
    }
    if (filter.since) {
      messages = messages.filter(m => m.timestamp >= filter.since);
    }

    return messages;
  }
}
