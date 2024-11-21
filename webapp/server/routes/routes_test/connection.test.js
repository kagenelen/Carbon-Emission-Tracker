/**
* @file Tests for checking MongoDB connection
*/

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db, connectToDatabase, closeConnection } from '../../db/connection.js';
import { MongoClient } from 'mongodb';

// Mock the MongoDB module
vi.mock('mongodb', () => {
  const connectMock = vi.fn();
  const closeMock = vi.fn();
  const commandMock = vi.fn().mockResolvedValue({ ok: 1 });  // Return resolved value for ping

  return {
    MongoClient: vi.fn(() => ({
      connect: connectMock,  // Mock connect
      db: vi.fn(() => ({
        command: commandMock,  // Mock db.command method (for ping)
      })),
      close: closeMock,  // Mock close method
    })),
    ServerApiVersion: { v1: '1' },  // Mock ServerApiVersion
  };
});

describe('MongoDB connection', () => {
  let connectMock, closeMock, commandMock;

  beforeEach(() => {
    vi.clearAllMocks();  // Clear mocks before each test

    // Retrieve the mocked functions
    connectMock = MongoClient().connect;
    closeMock = MongoClient().close;
    commandMock = MongoClient().db().command;
  });

  // it('should connect successfully and ping the server', async () => {
  //   await connectToDatabase();  // Trigger the connection logic

  //   expect(connectMock).toHaveBeenCalledTimes(1);  // Ensure connect was called
  //   expect(commandMock).toHaveBeenCalledWith({ ping: 1 });  // Ensure ping command was called
  // });

  // it('should handle connection failure', async () => {
  //   const error = new Error('Failed to connect');
  //   connectMock.mockRejectedValueOnce(error);  // Simulate a connection failure

  //   try {
  //     await connectToDatabase();
  //   } catch (err) {
  //     expect(err).toBe(error);  // Ensure the error is thrown
  //   }

  //   expect(connectMock).toHaveBeenCalledTimes(1);  // Ensure connect was called
  //   expect(commandMock).not.toHaveBeenCalled();  // Ensure ping command was NOT called
  // });

  // it('should close the connection when done', async () => {
  //   await connectToDatabase();  // Trigger the connection logic
  //   await closeConnection();  // Trigger the close logic

  //   expect(closeMock).toHaveBeenCalledTimes(1);  // Ensure close was called
  // });

  it('should not close the connection if there was a connection failure', async () => {
    const error = new Error('Failed to connect');
    connectMock.mockRejectedValueOnce(error);  // Simulate a connection failure

    try {
      await connectToDatabase();
    } catch (err) {
      expect(err).toBe(error);  // Ensure the error is thrown
    }

    expect(closeMock).not.toHaveBeenCalled();  // Ensure close was NOT called
  });
});
